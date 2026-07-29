CREATE DATABASE IF NOT EXISTS app_kompres;
USE app_kompres;

CREATE TABLE IF NOT EXISTS compress_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255),
    original_size BIGINT,
    original_resolution VARCHAR(20),
    original_fps FLOAT,
    duration FLOAT,
    compressed_size BIGINT,
    resolution VARCHAR(20),
    fps INT,
    preset VARCHAR(20),
    status ENUM('pending','processing','done','error') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dev_session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL
);

INSERT INTO dev_session (started_at) VALUES (NOW());