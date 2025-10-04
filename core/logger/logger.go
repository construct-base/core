package logger

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Logger is our custom logger interface that wraps the actual logging implementation
type Logger interface {
	Info(msg string, fields ...Field)
	Error(msg string, fields ...Field)
	Debug(msg string, fields ...Field)
	Warn(msg string, fields ...Field)
	Fatal(msg string, fields ...Field)
	With(fields ...Field) Logger
	GetZapLogger() *zap.Logger
}

// Field represents a log field
type Field = zapcore.Field

// Config holds the logger configuration
type Config struct {
	Environment string // "development" or "production"
	LogPath     string // Path to log directory
	Level       string // "debug", "info", "warn", "error", "fatal"
}

// ZapLogger implements the Logger interface using zap
type ZapLogger struct {
	logger *zap.Logger
}

// timeEncoder encodes the time as RFC3339Nano
func timeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(t.Format(time.RFC3339Nano))
}

// NewLogger creates a new logger based on the configuration
func NewLogger(config Config) (Logger, error) {
	var cfg zap.Config

	// Set default level if not specified
	level := zap.NewAtomicLevel()
	if err := level.UnmarshalText([]byte(config.Level)); err != nil {
		level.SetLevel(zapcore.InfoLevel)
	}

	if config.Environment == "development" {
		cfg = zap.NewDevelopmentConfig()
	} else {
		cfg = zap.NewProductionConfig()
	}

	cfg.EncoderConfig.EncodeTime = timeEncoder

	// Create log directory if it doesn't exist
	if err := os.MkdirAll(config.LogPath, 0755); err != nil {
		return nil, fmt.Errorf("can't create log directory: %w", err)
	}

	// Set up log file
	logFile := filepath.Join(config.LogPath, "app.log")
	f, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, fmt.Errorf("can't open log file: %w", err)
	}

	// Create logger with file and console output
	encoder := zapcore.NewJSONEncoder(cfg.EncoderConfig)

	// Custom console encoder config - clean minimal format
	consoleConfig := zap.NewDevelopmentEncoderConfig()

	// Disable timestamp, level, and caller for console output (only show message)
	consoleConfig.EncodeTime = zapcore.TimeEncoderOfLayout("") // No timestamp
	consoleConfig.EncodeCaller = nil                            // No file path
	consoleConfig.EncodeLevel = func(l zapcore.Level, enc zapcore.PrimitiveArrayEncoder) {
		// Don't encode level - we'll include it in the message if needed
	}
	consoleConfig.ConsoleSeparator = ""

	// Use console encoder for cleaner output
	consoleEncoder := zapcore.NewConsoleEncoder(consoleConfig)

	// Create multi-writer core
	core := zapcore.NewTee(
		zapcore.NewCore(
			encoder,
			zapcore.AddSync(f),
			level,
		),
		zapcore.NewCore(
			consoleEncoder,
			zapcore.AddSync(os.Stdout),
			level,
		),
	)
	// Don't add caller info for cleaner console output
	logger := zap.New(core, zap.AddCallerSkip(1))

	return &ZapLogger{logger: logger}, nil
}

// NewLoggerFromZap creates a new Logger from an existing zap.Logger
func NewLoggerFromZap(zapLogger *zap.Logger) Logger {
	return &ZapLogger{
		logger: zapLogger,
	}
}

// GetZapLogger returns the underlying zap logger
func (l *ZapLogger) GetZapLogger() *zap.Logger {
	return l.logger
}

// Field creation helpers
func String(key string, value string) Field {
	return zap.String(key, value)
}

func Int(key string, value int) Field {
	return zap.Int(key, value)
}

func Int64(key string, value int64) Field {
	return zap.Int64(key, value)
}

func Uint(key string, value uint) Field {
	return zap.Uint(key, value)
}

func Uint64(key string, value uint64) Field {
	return zap.Uint64(key, value)
}

func Float64(key string, value float64) Field {
	return zap.Float64(key, value)
}

func Float32(key string, value float32) Field {
	return zap.Float32(key, value)
}

func Bool(key string, value bool) Field {
	return zap.Bool(key, value)
}

func Any(key string, value any) Field {
	return zap.Any(key, value)
}

func Duration(key string, value time.Duration) Field {
	return zap.Duration(key, value)
}

// Logger interface implementation
func (l *ZapLogger) Info(msg string, fields ...Field) {
	l.logger.Info(msg, fields...)
}

func (l *ZapLogger) Error(msg string, fields ...Field) {
	l.logger.Error(msg, fields...)
}

func (l *ZapLogger) Debug(msg string, fields ...Field) {
	l.logger.Debug(msg, fields...)
}

func (l *ZapLogger) Warn(msg string, fields ...Field) {
	l.logger.Warn(msg, fields...)
}

func (l *ZapLogger) Fatal(msg string, fields ...Field) {
	l.logger.Fatal(msg, fields...)
}

func (l *ZapLogger) With(fields ...Field) Logger {
	return &ZapLogger{logger: l.logger.With(fields...)}
}
