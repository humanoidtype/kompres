CREATE TABLE IF NOT EXISTS dev_session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS compress_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_size BIGINT NOT NULL,
    original_resolution VARCHAR(20) DEFAULT NULL,
    original_fps DECIMAL(5,2) DEFAULT NULL,
    duration DECIMAL(10,3) DEFAULT NULL,
    compressed_size BIGINT DEFAULT NULL,
    resolution VARCHAR(20) DEFAULT NULL,
    fps INT DEFAULT NULL,
    preset VARCHAR(20) NOT NULL DEFAULT 'pending',
    status ENUM('pending', 'processing', 'done', 'error') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO dev_session (started_at) VALUES (NOW());
