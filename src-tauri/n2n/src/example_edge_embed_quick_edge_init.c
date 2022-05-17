/**
 * (C) 2007-22 - ntop.org and contributors
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not see see <http://www.gnu.org/licenses/>
 *
 */

#include "n2n.h"

/*
    This tool demonstrates how to easily embed
    n2n on an existing application
 */

int main(int argc, char *argv[]) {

#ifdef WIN32
    initWin32();
#endif

    char *device_name = (char *) "{9F8DF54E-F86B-4E75-B3D0-1B691209A9ED}";
    char *network_name = (char *) "mynetwork";
    char *secret_key = (char *) NULL;
    char *my_mac_address = (char *) "DE:AD:BE:EF:01:10";
    char *my_ipv4_addr = (char *) "172.27.228.166";
    char *supernode = (char *) "n2n.s1.bugxia.com:9527";
    int keep_on_running = 1;

    /* Increase tracelevel to see what's happening */
    setTraceLevel(5);

    /* Random seed */
    n2n_srand(n2n_seed());

    /*
       NOTE

       As the function below won't end, you should
       call it inside a separate thread
     */
    (quick_edge_init(device_name,
                     network_name,
                     secret_key,
                     my_mac_address,
                     my_ipv4_addr,
                     supernode,
                     &keep_on_running));

#ifdef WIN32
    destroyWin32();
#endif
    return 0;
}
