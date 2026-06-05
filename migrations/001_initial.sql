CREATE TABLE IF NOT EXISTS raw_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chain VARCHAR(64) NOT NULL,
  block_number BIGINT UNSIGNED NOT NULL,
  transaction_hash VARCHAR(66) NOT NULL,
  log_index INT UNSIGNED NOT NULL,
  address VARCHAR(42) NOT NULL,
  topics JSON NOT NULL,
  data TEXT NOT NULL,
  timestamp BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_log (chain, transaction_hash, log_index),
  INDEX idx_chain_block (chain, block_number),
  INDEX idx_chain_address (chain, address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stake_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chain VARCHAR(64) NOT NULL,
  block_number BIGINT UNSIGNED NOT NULL,
  transaction_hash VARCHAR(66) NOT NULL,
  wallet VARCHAR(42) NOT NULL,
  amount VARCHAR(78) NOT NULL,
  timestamp BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_stake (chain, transaction_hash),
  INDEX idx_chain_wallet (chain, wallet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS unstake_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chain VARCHAR(64) NOT NULL,
  block_number BIGINT UNSIGNED NOT NULL,
  transaction_hash VARCHAR(66) NOT NULL,
  wallet VARCHAR(42) NOT NULL,
  amount VARCHAR(78) NOT NULL,
  timestamp BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_unstake (chain, transaction_hash),
  INDEX idx_chain_wallet (chain, wallet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS indexer_state (
  chain VARCHAR(64) PRIMARY KEY,
  last_indexed_block BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
