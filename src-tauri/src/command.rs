use std::{ffi::CString, os::raw::c_char};

use serde::{Deserialize, Serialize};

use crate::n2n;

#[derive(Serialize, Deserialize, Debug)]
struct N2NServer {
    host: String,
    community: String,
    #[serde(rename = "enablePMTU")]
    enable_pmtu: bool,
    #[serde(rename = "supernodeForward")]
    supernode_forward: String,
    #[serde(rename = "regInterval")]
    reg_interval: i32,
    compress: String,
}

#[tauri::command]
#[allow(dead_code)]
pub fn start_edge(server: String) {
    println!("{}", server);
    let config: N2NServer = serde_json::from_str(server.as_str()).unwrap();
    println!("{:#?}", config);

    unsafe {
        n2n::edge_init_config();
        n2n::edge_set_config('l' as c_char, CString::new(config.host).unwrap().into_raw());
        n2n::edge_set_config(
            'c' as c_char,
            CString::new(config.community).unwrap().into_raw(),
        );

        if config.enable_pmtu {
            n2n::edge_set_config('D' as c_char, CString::new("").unwrap().into_raw());
        }

        if config.supernode_forward != "NONE" {
            if config.supernode_forward == "S1" {
                n2n::edge_set_config('S' as c_char, CString::new("1").unwrap().into_raw());
            } else if config.supernode_forward == "S2" {
                n2n::edge_set_config('S' as c_char, CString::new("2").unwrap().into_raw());
            }
        }

        n2n::edge_set_config(
            'i' as c_char,
            CString::new(config.reg_interval.to_string())
                .unwrap()
                .into_raw(),
        );

        if config.compress != "NONE" {
            n2n::edge_set_config('z' as c_char, CString::new("1").unwrap().into_raw());
        }

        if cfg!(not(windows)) {
            n2n::edge_set_config('f' as c_char, CString::new("").unwrap().into_raw());
        }

        n2n::edge_start();
    }
}

#[tauri::command]
#[allow(dead_code)]
pub fn stop_edge() {
    unsafe {
        n2n::edge_stop();
    }
}

#[tauri::command]
#[allow(dead_code)]
pub fn get_edge_info() -> String {
    println!("test");
    return unsafe {
        n2n::convert_c_string(n2n::get_edge_info())
            .unwrap_or("")
            .to_string()
    };
}
