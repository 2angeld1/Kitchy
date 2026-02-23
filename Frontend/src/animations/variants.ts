import { Variants, Transition } from 'framer-motion';

/**
 * Kitchy Animation System (Powered by Framer Motion)
 * Definimos variantes reutilizables para mantener la consistencia en toda la app.
 */

export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.3 }
    }
};

export const slideUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: {
        opacity: 0,
        y: 20,
        transition: { duration: 0.2 }
    }
};

export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05
        }
    }
};

export const listItemVariant: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', damping: 20, stiffness: 200 }
    }
};

export const scaleUp: Variants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
        scale: 1,
        opacity: 1,
        transition: { type: 'spring', damping: 20, stiffness: 300 }
    },
    exit: {
        scale: 0.9,
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

export const springTransition: Transition = {
    type: 'spring',
    damping: 25,
    stiffness: 350
};
