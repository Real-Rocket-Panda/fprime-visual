namespace Svc

component CommandDispatcher {
    port compCmdSend:Fw.Cmd {
        direction = out
        max_number = 10
        min_number = 1
    }
    port compCmdReg:Fw.CmdReg {
        direction = in
        kind = guarded
        max_number = 10
        min_number = 1
    }
    port compCmdStat:Fw.CmdResponse {
        direction = in
        kind = async
        max_number = 10
        min_number = 1
    }
    port seqCmdStatus:Fw.CmdResponse {
        direction = out
        max_number = 10
        min_number = 1
    }
    port seqCmdBuff:Fw.Com {
        direction = in
        kind = async
        max_number = 10
        min_number = 1
    }
    port pingOut:Svc.Ping {
        direction = out
        number = 1
    }
}