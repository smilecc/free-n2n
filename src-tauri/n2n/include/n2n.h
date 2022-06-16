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

#ifndef _N2N_H_
#define _N2N_H_

/*
    tunctl -t tun0
    tunctl -t tun1
    ifconfig tun0 1.2.3.4 up
    ifconfig tun1 1.2.3.5 up
    ./edge -d tun0 -l 2000 -r 127.0.0.1:3000 -c hello
    ./edge -d tun1 -l 3000 -r 127.0.0.1:2000 -c hello


    tunctl -u UID -t tunX
*/

#define SN_MANUAL_MAC   /* allows supernode MAC address to be set manually */

#define N2N_HAVE_DAEMON /* needs to be defined before it gets undefined */
#define N2N_HAVE_TCP    /* needs to be defined before it gets undefined */

/* #define N2N_CAN_NAME_IFACE */

/* Moved here to define _CRT_SECURE_NO_WARNINGS before all the including takes place */
#ifdef WIN32
#ifndef CMAKE_BUILD
#include "config.h" /* Visual C++ */
#else

#include "winconfig.h"

#endif
#define N2N_CAN_NAME_IFACE 1
#undef N2N_HAVE_DAEMON
#undef N2N_HAVE_TCP           /* as explained on https://github.com/ntop/n2n/pull/627#issuecomment-782093706 */
#undef N2N_HAVE_SETUID
#else
#ifndef CMAKE_BUILD
#include "config.h"
#endif
#endif



#define PACKAGE_BUILDDATE (__DATE__ " " __TIME__)

#include <time.h>
#include <ctype.h>
#include <stdlib.h>

#ifndef WIN32
#include <netdb.h>
#endif

#ifndef _MSC_VER
#include <getopt.h>
#endif /* #ifndef _MSC_VER */

#include <stdio.h>
#include <errno.h>
#include <fcntl.h>
#include <stdint.h>
#include <time.h>

#ifndef WIN32
#include <unistd.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <sys/param.h>
#include <pthread.h>

#ifdef __linux__
#define N2N_CAN_NAME_IFACE 1
#include <linux/netlink.h>
#include <linux/rtnetlink.h>
#include <unistd.h>
#include <net/if_arp.h>
#include <net/if.h>
#include <linux/if_tun.h>
#include <linux/netlink.h>
#include <linux/rtnetlink.h>
#endif /* #ifdef __linux__ */

#ifdef __FreeBSD__
#include <netinet/in_systm.h>
#endif /* #ifdef __FreeBSD__ */

#include <syslog.h>
#include <sys/wait.h>

#ifdef HAVE_ZSTD
#include <zstd.h>
#endif

#include <netinet/in.h>
#include <netinet/ip.h>
#include <netinet/udp.h>
#include <netinet/tcp.h>
#include <arpa/inet.h>
#include <sys/types.h>
#include <sys/time.h>
#include <unistd.h>
#include <string.h>
#include <assert.h>
#include <sys/stat.h>
#include <stdint.h>
#if defined (HAVE_OPENSSL_1_1)
#include <openssl/opensslv.h>
#include <openssl/crypto.h>
#endif

#define closesocket(a) close(a)
#endif /* #ifndef WIN32 */

#include "minilzo.h"
#include <signal.h>
#include <string.h>
#include <stdarg.h>
#include "lzoconf.h"
#include "uthash.h"
#include "n2n_define.h"
#include "n2n_typedefs.h"

#ifdef WIN32
#include <winsock2.h>           /* for tcp */
#define SHUT_RDWR   SD_BOTH     /* for tcp */
#include "wintap.h"
#include <sys/stat.h>
#else
#include <pwd.h>
#endif /* #ifdef WIN32 */

#include "n2n_wire.h"
#include "random_numbers.h"
#include "pearson.h"
#include "portable_endian.h"
#include "aes.h"
#include "cc20.h"
#include "speck.h"
#include "curve25519.h"
#include "n2n_regex.h"
#include "sn_selection.h"
#include "network_traffic_filter.h"
#include "auth.h"

#if defined(HAVE_MINIUPNP) || defined(HAVE_NATPMP)
#include "n2n_port_mapping.h"
#endif // HAVE_MINIUPNP || HAVE_NATPMP

/* ************************************** */

#include "header_encryption.h"
#include "tf.h"

#ifndef TRACE_ERROR
#define TRACE_ERROR       0
#define TRACE_WARNING     1
#define TRACE_NORMAL      2
#define TRACE_INFO        3
#define TRACE_DEBUG       4
#endif

/* ************************************** */

static int global_keep_running = 0;

/* Transop Init Functions */
int n2n_transop_null_init (const n2n_edge_conf_t *conf, n2n_trans_op_t *ttt);
int n2n_transop_tf_init (const n2n_edge_conf_t *conf, n2n_trans_op_t *ttt);
int n2n_transop_aes_init (const n2n_edge_conf_t *conf, n2n_trans_op_t *ttt);
int n2n_transop_cc20_init (const n2n_edge_conf_t *conf, n2n_trans_op_t *ttt);
int n2n_transop_speck_init (const n2n_edge_conf_t *conf, n2n_trans_op_t *ttt);
int n2n_transop_lzo_init (const n2n_edge_conf_t *conf, n2n_trans_op_t *ttt);
#ifdef HAVE_ZSTD
int n2n_transop_zstd_init (const n2n_edge_conf_t *conf, n2n_trans_op_t *ttt);
#endif

/* Log */
void setTraceLevel (int level);
void setUseSyslog (int use_syslog);
void setTraceFile (FILE *f);
FILE *getTraceFile ();
int getTraceLevel ();
void closeTraceFile ();
void _traceEvent (int eventTraceLevel, char* file, int line, char * format, ...);
#define traceEvent(level, format, ...) _traceEvent(level, __FILE__, __LINE__, format, ##__VA_ARGS__)

/* Tuntap API */
int tuntap_open (struct tuntap_dev *device, char *dev, const char *address_mode, char *device_ip,
                 char *device_mask, const char * device_mac, int mtu
#ifdef WIN32
				, int metric
#endif
                 );
int tuntap_read (struct tuntap_dev *tuntap, unsigned char *buf, int len);
int tuntap_write (struct tuntap_dev *tuntap, unsigned char *buf, int len);
void tuntap_close (struct tuntap_dev *tuntap);
void tuntap_get_address (struct tuntap_dev *tuntap);

/* Utils */
char* intoa (uint32_t addr, char* buf, uint16_t buf_len);
uint32_t bitlen2mask (uint8_t bitlen);
uint8_t mask2bitlen (uint32_t mask);
char* macaddr_str (macstr_t buf, const n2n_mac_t mac);
int str2mac (uint8_t * outmac /* 6 bytes */, const char * s);
int supernode2sock (n2n_sock_t * sn, const n2n_sn_name_t addrIn);
uint8_t is_multi_broadcast (const n2n_mac_t dest_mac);
uint8_t is_broadcast (const n2n_mac_t dest_mac);
uint8_t is_null_mac (const n2n_mac_t dest_mac);
char* msg_type2str (uint16_t msg_type);
void hexdump (const uint8_t * buf, size_t len);
void print_n2n_version ();
int is_empty_ip_address (const n2n_sock_t * sock);
void print_edge_stats (const n2n_edge_t *eee);
int memrnd (uint8_t *address, size_t len);
int memxor (uint8_t *destination, const uint8_t *source, size_t len);

/* Sockets */
char* sock_to_cstr (n2n_sock_str_t out,
                    const n2n_sock_t * sock);
char * ip_subnet_to_str (dec_ip_bit_str_t buf, const n2n_ip_subnet_t *ipaddr);
SOCKET open_socket (int local_port, in_addr_t address, int type);
int sock_equal (const n2n_sock_t * a,
                const n2n_sock_t * b);

/* Header encryption */
uint64_t time_stamp (void);
uint64_t initial_time_stamp (void);
int time_stamp_verify_and_update (uint64_t stamp, uint64_t * previous_stamp, int allow_jitter);

/* Operations on peer_info lists. */
size_t purge_peer_list (struct peer_info ** peer_list,
                        SOCKET socket_not_to_close,
                        n2n_tcp_connection_t **tcp_connections,
                        time_t purge_before);

size_t clear_peer_list (struct peer_info ** peer_list);

size_t purge_expired_nodes (struct peer_info **peer_list,
                            SOCKET socket_not_to_close,
                            n2n_tcp_connection_t **tcp_connections,
                            time_t *p_last_purge,
                            int frequency, int timeout);

/* Edge conf */
void edge_init_conf_defaults (n2n_edge_conf_t *conf);
int edge_verify_conf (const n2n_edge_conf_t *conf);
int edge_conf_add_supernode (n2n_edge_conf_t *conf, const char *ip_and_port);
const n2n_edge_conf_t* edge_get_conf (const n2n_edge_t *eee);
void edge_term_conf (n2n_edge_conf_t *conf);

/* Public functions */
n2n_edge_t* edge_init (const n2n_edge_conf_t *conf, int *rv);
void update_supernode_reg (n2n_edge_t * eee, time_t nowTime);
void readFromIPSocket (n2n_edge_t * eee, int in_sock);
void edge_term (n2n_edge_t *eee);
void edge_set_callbacks (n2n_edge_t *eee, const n2n_edge_callbacks_t *callbacks);
void edge_set_userdata (n2n_edge_t *eee, void *user_data);
void* edge_get_userdata (n2n_edge_t *eee);
void edge_send_packet2net (n2n_edge_t *eee, uint8_t *tap_pkt, size_t len);
void edge_read_from_tap (n2n_edge_t *eee);
int edge_get_n2n_socket (n2n_edge_t *eee);
int edge_get_management_socket (n2n_edge_t *eee);
int run_edge_loop (n2n_edge_t *eee);
int quick_edge_init (char *device_name, char *community_name,
                     char *encrypt_key, char *device_mac,
                     char *local_ip_address,
                     char *supernode_ip_address_port,
                     int *keep_on_running);
int comm_init (struct sn_community *comm, char *cmn);
int sn_init_defaults (n2n_sn_t *sss);
void sn_init (n2n_sn_t *sss);
void sn_term (n2n_sn_t *sss);
int supernode2sock (n2n_sock_t * sn, const n2n_sn_name_t addrIn);
struct peer_info* add_sn_to_list_by_mac_or_sock (struct peer_info **sn_list, n2n_sock_t *sock, const n2n_mac_t mac, int *skip_add);
int run_sn_loop (n2n_sn_t *sss);
int assign_one_ip_subnet (n2n_sn_t *sss, struct sn_community *comm);
const char* compression_str (uint8_t cmpr);
const char* transop_str (enum n2n_transform tr);

void readFromMgmtSocket (n2n_edge_t *eee);

void mgmt_event_post (enum n2n_event_topic topic, int data0, void *data1);
#endif /* _N2N_H_ */
