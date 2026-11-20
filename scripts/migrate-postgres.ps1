Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Read-PostgresUrl {
    param([string]$Prompt)

    while ($true) {
        $value = Read-Host $Prompt
        if ($value -match '^jdbc:postgresql://[^\s]+$') {
            $value = $value.Substring(5)
            $value = [regex]::Replace($value, '([?&])channelBinding=', '${1}channel_binding=', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            return $value
        }
        if ($value -match '^postgres(ql)?://[^\s]+$') {
            return $value
        }
        Write-Host 'Invalid URL. Enter a PostgreSQL URL or a JDBC URL starting with jdbc:postgresql://.' -ForegroundColor Yellow
    }
}

foreach ($tool in @('pg_dump', 'pg_restore', 'psql')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
    throw "Cannot find $tool. Install PostgreSQL client tools and add them to PATH."
    }
}

$sourceUrl = Read-PostgresUrl 'Enter the source database URL'
$targetUrl = Read-PostgresUrl 'Enter the destination database URL'
if ($sourceUrl -eq $targetUrl) {
    throw 'Source and destination URLs are identical. Stopping to avoid an accidental self-copy.'
}

Write-Host "`nChecking whether the destination database has user tables..."
$tableCount = & psql $targetUrl -X -A -t -v ON_ERROR_STOP=1 -c "SELECT count(*) FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema');"
if ($LASTEXITCODE -ne 0) { throw 'Could not connect to or inspect the destination database.' }
if ([int]($tableCount | Select-Object -Last 1) -gt 0) {
    throw 'The destination already has tables. This script only runs against an empty database to prevent overwriting or mixing data.'
}

$confirmation = Read-Host 'Destination is empty. Type MIGRATE to copy the entire database'
if ($confirmation -cne 'MIGRATE') {
    Write-Host 'Cancelled. No data was copied.'
    exit 0
}

$dumpPath = Join-Path ([System.IO.Path]::GetTempPath()) ("postgres-migration-{0}.dump" -f [guid]::NewGuid())
try {
    Write-Host 'Creating a dump from the source database...'
    & pg_dump --format=custom --no-owner --no-acl --verbose --file $dumpPath $sourceUrl
    if ($LASTEXITCODE -ne 0) { throw 'pg_dump failed. The destination has not been changed.' }

    Write-Host 'Restoring into the destination database...'
    & pg_restore --no-owner --no-acl --exit-on-error --verbose --dbname $targetUrl $dumpPath
    if ($LASTEXITCODE -ne 0) { throw 'pg_restore failed. Check the output above; the destination may be partially restored.' }

    Write-Host 'Database copy completed.' -ForegroundColor Green
}
finally {
    Remove-Item -LiteralPath $dumpPath -Force -ErrorAction SilentlyContinue
    $sourceUrl = $null
    $targetUrl = $null
}
