package logging

import (
	"encoding/json"
	"testing"
)

func TestParseToJson(t *testing.T) {

	Init()

	logBuilder := Builder()
	LogBuilderBase := logBuilder.AddWorkflowSteps("Base", "Extended")
	logBuilderBaseExtendend := LogBuilderBase.AddWorkflowSteps("Extra")
	logBuilderBaseExtendend.SetStatus(InProgress)
	logEntry := logBuilderBaseExtendend.Build("ext_id", "test_message")

	jsonString := logEntry.toJson()

	parsedLogEntry := LogEntry{}
	json.Unmarshal([]byte(jsonString), &parsedLogEntry)

	if parsedLogEntry.WorkflowStep != logEntry.WorkflowStep {
		t.Error("Json mapping failed: context is not equal")
	}

	if parsedLogEntry.ExtensionID != logEntry.ExtensionID {
		t.Error("Json mapping failed: extension ID is not equal")
	}

	if parsedLogEntry.Status != logEntry.Status {
		t.Error("Json mapping failed: status is not equal")
	}

	if parsedLogEntry.Level != logEntry.Level {
		t.Error("Json mapping failed: level is not equal")
	}
}
