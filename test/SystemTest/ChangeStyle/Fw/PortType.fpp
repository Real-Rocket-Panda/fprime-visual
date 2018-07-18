namespace Fw

datatype FwEventIdType
datatype Time
datatype TextLogString
datatype LogBuffer
datatype ComBuffer
datatype FwOpcodeType
datatype CmdArgBuffer
datatype TlmBuffer
datatype FwChanIdType

porttype LogText {
    arg id:FwEventIdType
    arg timeTag:Fw.Time { pass_by = reference }
    arg severity:TextLogSeverity
    arg text:Fw.TextLogString { pass_by = reference }
}
 
porttype Log {
    arg id:FwEventIdType
    arg timeTag:Fw.Time { pass_by = reference }
    arg severity:TextLogSeverity
    arg text:LogBuffer { pass_by = reference }
}
 
porttype Com {
    arg data:ComBuffer { pass_by = reference }
    arg context:U32
}
 
porttype Time {
    arg time:Fw.Time { pass_by = reference }
}
 
porttype CmdReg {
    arg opCode:FwOpcodeType
}
 
porttype Cmd {
    arg opCode:FwOpcodeType
    arg cmdSeq:U32
    arg args:CmdArgBuffer { pass_by = reference }
}
 
porttype CmdResponse {
    arg opCode:FwOpcodeType
    arg cmdSeq:U32
    arg response:CommandResponse
}
 
porttype Tlm {
    arg id:FwChanIdType
    arg timeTag:Fw.Time { pass_by = reference }
    arg val:TlmBuffer { pass_by = reference }
}