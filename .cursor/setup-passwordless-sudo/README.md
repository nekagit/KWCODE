# Passwordless sudo for user `nenad`

Run these commands **in your own terminal** (you will be asked for your password once):

```bash
# Create sudoers drop-in so nenad can use sudo without password
echo 'nenad ALL=(ALL) NOPASSWD: ALL' | sudo tee /etc/sudoers.d/90-nopasswd
sudo chmod 440 /etc/sudoers.d/90-nopasswd
```

After that, `sudo` will no longer ask for a password for user `nenad`.

**To remove it later** (go back to requiring a password):

```bash
sudo rm /etc/sudoers.d/90-nopasswd
```
