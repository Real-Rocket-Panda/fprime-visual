namespace Ref

component SignalGen {
    port timeCaller:Fw.Time {
        direction = out
        number = 1
        role = TimeGet
    }
    port cmdRegOut:Fw.CmdReg {
        direction = out
        number = 1
        role = CmdRegistration
    }
    port cmdIn:Fw.Cmd {
        direction = in
        number = 1
    }
    port schedIn:Svc.Sched {
        direction = in
        kind = sync
        number = 1
    }
    port logTextOut:Fw.LogText {
        direction = out
        number = 1
        role = LogTextEvent
    }
    port logOut:Fw.Log {
        direction = out
        number = 1
        role = LogEvent
    }
    port cmdResponseOut:Fw.CmdResponse {
        direction = out
        number = 1
        role = CmdResponse
    }
    port tlmOut:Fw.Tlm {
        direction = out
        number = 1
        role = Telemetry
    }
}