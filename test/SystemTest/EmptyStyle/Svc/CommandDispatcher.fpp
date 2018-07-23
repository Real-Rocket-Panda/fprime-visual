namespace Svc

component CommandDispatcher {
    kind = active
    port compCmdSend:Fw.Cmd {
        direction = out
        number = 1..10
        // number = $CmdDispatcherComponentCommandPorts
    }
    port compCmdReg:Fw.CmdReg {
        kind = guarded
        direction = in
        number = 1..10
        // number = $CmdDispatcherComponentCommandPorts
    }
    port compCmdStat:Fw.CmdResponse {
        kind = async
        direction = in
        number = 1..10
    }
    port seqCmdStatus:Fw.CmdResponse {
        direction = out
        number = 1..10
        // number = $CmdDispatcherSequencePorts
    }
    port seqCmdBuff:Fw.Com {
        kind = async
        direction = in
        number = 1..10
        // number = $CmdDispatcherSequencePorts
    }
    port pingOut:Svc.Ping {
        direction = out
        number = 1
    }
}
