import { motion } from 'framer-motion';

/**
 * PageTransition
 * ─────────────────────────────────────────────────────────────────
 * Wrap each route element so that AnimatePresence in the parent
 * can mount/unmount it with a real framer-motion animation.
 *
 * Usage:
 *   <AnimatePresence mode="wait">
 *     <PageTransition key={location.pathname}>
 *       <MyPage />
 *     </PageTransition>
 *   </AnimatePresence>
 *
 * The KEY must be set on the PageTransition element itself (not as
 * a prop) so AnimatePresence sees a new keyed sibling on every
 * route change. If you forget the key, transitions stop.
 *
 * Easing: same custom curve used by the rest of the design system
 * (.fw-*, .page-enter in index.css) so motion feels consistent.
 */

const EASE = [0.22, 1, 0.36, 1];

export default function PageTransition({ children, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EASE }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
