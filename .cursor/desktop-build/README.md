# Desktop build (Tauri)

## Quick start

```bash
./script/install-deps-and-build-desktop.sh
```

Requires: Node, npm, Rust (cargo), and Linux system libraries for GTK/WebKit.

---

## Kali Linux: 404 errors when installing dependencies

If `apt-get install` fails with many **404 Not Found** errors, your Kali repository mirror is out of date or misconfigured. The Tauri build needs packages like `libglib2.0-dev`, `libwebkit2gtk-4.1-dev`, etc.; they must be installed for the desktop app to compile.

### Fix Kali repositories

1. **Update the repository key** (if you see `NO_PUBKEY`):
   ```bash
   sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys ED65462EC8D5E4C5
   ```

2. **Use a working mirror** in `/etc/apt/sources.list`. For example, switch to `archive.kali.org` or another official mirror:
   ```bash
   # Example: replace http.kali.org with archive.kali.org
   # Edit /etc/apt/sources.list and use:
   deb http://archive.kali.org/kali kali-rolling main non-free contrib
   deb-src http://archive.kali.org/kali kali-rolling main non-free contrib
   ```
   Or use the mirror selector: https://http.kali.org/README_mirror-selector

3. **Update and install**:
   ```bash
   sudo apt-get update
   ./script/install-deps-and-build-desktop.sh
   ```

### If you cannot fix Kali repos

- Build on another system (e.g. Ubuntu/Debian or macOS) and copy the built AppImage, or  
- Run the app as a **web app** only: `npm run build && npm run start` and open http://127.0.0.1:3000 (no desktop binary).

---

## Build without the install script

If dependencies are already installed:

```bash
. "$HOME/.cargo/env"   # if Rust was installed via rustup
cd /path/to/KWCODE
npm run build:desktop
```

Output is copied to `~/Desktop/KWCODE/` (AppImage on Linux).
