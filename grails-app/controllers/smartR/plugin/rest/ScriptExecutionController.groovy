package smartR.plugin.rest

import grails.validation.Validateable
import heim.session.SessionService
import heim.tasks.TaskResult

class ScriptExecutionController {

    static scope = 'request'

    SessionService sessionService
    def sendFileService

    static allowedMethods = [
            init  : 'POST',
            run   : 'POST',
            status: 'GET',
            downloadFile: 'GET',
    ]

    def run(RunCommand runCommand) {
        UUID executionId =
                sessionService.createTask(
                        runCommand.arguments,
                        runCommand.sessionId,
                        runCommand.taskType,)

        render(contentType: 'text/json') {
            [executionId: executionId.toString()]
        }
    }

    def status(StatusCommand statusCommand) {
        Map status = sessionService.getTaskData(
                statusCommand.sessionId,
                statusCommand.executionId,
                statusCommand.waitForCompletion)

        TaskResult res = status.result
        def resultValue = null
        if (res != null) {
            String exceptionMessage
            if (res.exception) {
                exceptionMessage = res.exception.getClass().toString() +
                        ': ' + res.exception.message
            }
            resultValue = [
                    successful: res.successful,
                    exception: exceptionMessage,
                    artifacts: res.artifacts,
            ]
        }

        render(contentType: 'text/json') {
            [
                    state : status.state.toString(),
                    result: resultValue
            ]
        }
    }

    def downloadFile(DownloadCommand downloadCommand) {
        sessionService.getFile(
                downloadCommand.sessionId,
                downloadCommand.executionId,
                downloadCommand.filename)

        File selectedFile = sessionService.getFile(
                downloadCommand.sessionId,
                downloadCommand.executionId,
                downloadCommand.filename)

        sendFileService.sendFile servletContext, request, response, selectedFile
    }

    /**
     * Lists files generated by the R script.
     *{*  'sessionId': '',
     *  'executionId':'',
     *
     * }
     */
    def files(){
        def sessionId = request.JSON.sessionId
        def executionId = request.JSON.executionId

        def files = RServeSessionService.getScriptExecutionFiles(sessionId,executionId)
        render(contentType: 'text/json') {
            [files: files]
        }
    }
}

@Validateable
class StatusCommand {
    UUID sessionId
    UUID executionId
    boolean waitForCompletion

    static constraints = {
        sessionId   blank: false
        executionId blank: false
    }
}

@Validateable
class RunCommand {
    UUID sessionId
    Map arguments = [:]
    String taskType

    static constraints = {
        sessionId blank: false
        taskType  blank: false
    }
}

@Validateable
class DownloadCommand {
    UUID sessionId
    UUID executionId
    String filename

    static constraints = {
        sessionId   blank: false
        executionId blank: false
        filename    blank: false
    }
}