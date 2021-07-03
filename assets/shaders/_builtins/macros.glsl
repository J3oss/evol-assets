#ifndef EV_GLSL_MACROS_H
#define EV_GLSL_MACROS_H

#define __EV_CAT_IMPL(a,...) a##__VA_ARGS__
#define EV_CAT(a,...) __EV_CAT_IMPL(a, __VA_ARGS__)

#endif
