# Plan: Implement Loading State for Logout Flow

The goal is to prevent visual glitches during the logout process by introducing a loading state (`isLoggingOut`) in the `AuthContext` and updating the UI components to reflect this state.

## 1. Update `AuthContext.jsx`
- Add a new state `isLoggingOut` initialized to `false`.
- Modify `handleLogout` to:
    - Set `isLoggingOut(true)` at the start.
    - Perform the logout logic (API call to delete tokens).
    - Set `isLoggingOut(false)` in the `finally` block.
- Export `isLoggingOut` from the `AuthContext.Provider` value.

## 2. Update `PublicHeader.jsx`
- Consume `isLoggingOut` from `useAuth()`.
- Update the `logout` function to be `async`:
    - `await handleLogout()`
    - Then `navigate('/')`.
- Update the "Đăng xuất" button:
    - Disable the button when `isLoggingOut` is true.
    - Change the label to "Đang đăng xuất..." when `isLoggingOut` is true.
    - (Optional) Add a loading spinner if it fits the design, but a text change and disable is the primary requirement.

## 3. Update `Sidebar.jsx`
- Consume `isLoggingOut` from `useAuth()`.
- Update the `menuItems` array logic or the rendering of the logout button:
    - Since `menuItems` is defined inside the component, we can update the `onClick` handler.
    - The logout button should be disabled and show "Đang đăng xuất..." when `isLoggingOut` is true.

## 4. Verification
- Log in to the application.
- Click the logout button in both `PublicHeader` and `Sidebar`.
- Observe if the button disables and text changes to "Đang đăng xuất...".
- Verify that the navigation to `/` occurs only after the logout process completes.
- Check console for any errors.
