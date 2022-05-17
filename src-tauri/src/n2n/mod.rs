use std::ffi::{c_void, CString};
use std::os::raw::{c_char, c_int};

#[link(name = "n2n", kind = "static")]
extern "C" {
    pub fn print_n2n_version() -> c_void;
    pub fn edge_init_config() -> c_int;
    pub fn edge_set_config(key: c_char, value: *mut c_char) -> c_int;
    pub fn edge_start() -> c_int;
    pub fn edge_stop() -> c_void;
}
