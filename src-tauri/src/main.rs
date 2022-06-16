#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// use std::ffi::CString;
// use std::os::raw::c_char;
// use std::thread;

use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayMenu, SystemTrayMenuItem};
use tauri_plugin_log::{LogTarget, LoggerBuilder};

mod command;
mod n2n;

fn main() {
    unsafe {
        n2n::print_n2n_version();
    }

    // 创建托盘菜单
    let menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("test", "测试"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("close", "退出"));
    let tray = SystemTray::new().with_menu(menu);

    tauri::Builder::default()
        .plugin(
            LoggerBuilder::new()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            main_window.listen("test", |_| unsafe {
                n2n::edge_stop();
            });
            Ok(())
        })
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            tauri::SystemTrayEvent::MenuItemClick { id, .. } => {
                if id.to_string() == "close" {
                    app.exit(0);
                } else {
                    app.emit_all("tray_menu_click", id).unwrap();
                }
            }
            // tauri::SystemTrayEvent::LeftClick { position, size, .. } => {}
            // tauri::SystemTrayEvent::RightClick { position, size, .. } => {}
            tauri::SystemTrayEvent::DoubleClick {
                position: _,
                size: _,
                ..
            } => {
                let main_window = app.get_window("main").unwrap();
                if !main_window.is_visible().unwrap() {
                    main_window.show().unwrap();
                }

                main_window.unminimize().unwrap();
                main_window.set_focus().unwrap();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            command::start_edge,
            command::stop_edge,
            command::get_edge_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
