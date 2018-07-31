namespace Ref
 
 
    port cmdIn:Fw.Cmd {
        direction = in
        number = 1
    }
    port schedIn:Svc.Sched {
        kind = sync
        direction = in
        number = 1
    }
    port logTextOut:Fw.LogText {
        direction = out
        role = LogTextEvent
        number = 1
    }
    port logOut:Fw.Log {
        direction = out
        role = LogEvent
        number = 1
    }
    port cmdResponseOut:Fw.CmdResponse {
        direction = out
        role = CmdResponse
        number = 1
    }
    port tlmOut:Fw.Tlm {
        direction = out
        role = "Telemetry"
        number = 1
    }
}