import { motion, useReducedMotion } from 'framer-motion';

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

export default function PageTransition({ children, className = '', skipEnter = false }) {
    const prefersReducedMotion = useReducedMotion();
    const offset = prefersReducedMotion ? 0 : 8;
    return (
        <motion.div
            initial={skipEnter ? false : { opacity: 0, y: offset }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: EASE }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
