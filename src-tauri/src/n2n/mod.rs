use std::ffi::{c_void, CStr};
use std::os::raw::{c_char, c_int};

pub unsafe fn convert_c_string(str: *mut c_char) -> Option<&'static str> {
    let option_str = str.as_ref();
    if let Some(str_ptr) = option_str {
        let ip_addr_c_string = CStr::from_ptr(str_ptr);
        return Some(ip_addr_c_string.to_str().unwrap());
    }

    return None;
}

#[link(name = "n2n", kind = "static")]
extern "C" {
    pub fn print_n2n_version() -> c_void;
    pub fn edge_init_config() -> c_int;
    pub fn edge_set_config(key: c_char, value: *mut c_char) -> c_int;
    pub fn get_edge_info() -> *mut c_char;
    pub fn edge_start() -> c_int;
    pub fn edge_stop() -> c_void;
}
