use std::env;

fn main() {
    let dir = env::current_dir().unwrap();

    let os = env::var("CARGO_CFG_TARGET_OS").unwrap();
    let arch = env::var("CARGO_CFG_TARGET_ARCH").unwrap();

    if os == "windows" && arch == "x86_64" {
        println!("cargo:rustc-link-search=native={}\\libs\\win64", dir.to_str().unwrap());
        println!("cargo:rustc-link-arg=/NODEFAULTLIB:msvcrtd.lib");
        println!("cargo:rustc-link-lib=static=edge_utils_win32");
        println!("cargo:rustc-link-lib=static=n2n_win32");
        println!("cargo:rustc-link-lib=static=n2n");
    } else {
        panic!("No n2n library found for dist OS or ARCH.")
    }

    tauri_build::build()
}
