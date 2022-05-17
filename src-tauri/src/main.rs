#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::ffi::CString;
use std::os::raw::c_char;
use std::thread;

use tauri::Manager;

mod n2n;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            thread::spawn(|| unsafe {
                n2n::print_n2n_version();
                // n2n::edge_init_config();
                // n2n::edge_set_config('c' as c_char, CString::new("hello").unwrap().into_raw());
                // n2n::edge_set_config(
                //     'l' as c_char,
                //     CString::new("n2n.s1.bugxia.com:9527").unwrap().into_raw(),
                // );
                // n2n::edge_start();
            });

            let main_window = app.get_window("main").unwrap();
            main_window.listen("test", |_| unsafe {
                n2n::edge_stop();
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
