#!/usr/bin/env bash

rm -f include/config.h include/config.h.in include/config.h.in~ Makefile configure

echo "Wait please..."
autoreconf -if
