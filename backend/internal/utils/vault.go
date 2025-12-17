package utils

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	vault "github.com/hashicorp/vault/api"
)

const vaultTimeout = 5 * time.Second

func StoreCredentials(creds map[string]interface{}) (string, error) {

	if len(creds) == 0 {
		return "", errors.New("credentials cannot be empty")
	}

	addr := os.Getenv("VAULT_ADDR")
	token := os.Getenv("VAULT_TOKEN")
	mount := os.Getenv("VAULT_MOUNT")

	// ---- Vault client ----
	cfg := vault.DefaultConfig()
	cfg.Address = addr

	client, err := vault.NewClient(cfg)
	if err != nil {
		return "", fmt.Errorf("vault client init failed: %w", err)
	}
	client.SetToken(token)

	ctx, cancel := context.WithTimeout(context.Background(), vaultTimeout)
	defer cancel()

	id := fmt.Sprintf("cred-%d", time.Now().UnixNano())

	// ---- KV v2 write ----
	path := fmt.Sprintf("%s/data/%s", mount, id)
	payload := map[string]interface{}{
		"data": creds,
	}

	_, err = client.Logical().WriteWithContext(ctx, path, payload)

	return id, nil
}
