//
// Created by can on 2022/5/17.
//

#ifndef N2N_RUST_H
#define N2N_RUST_H

#include "n2n.h"

void edge_init_config();

int edge_set_config(char key, char *value);

int edge_start();

void edge_stop();

#endif //N2N_RUST_H
