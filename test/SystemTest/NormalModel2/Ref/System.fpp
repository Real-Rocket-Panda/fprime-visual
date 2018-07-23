namespace Ref
 
system sys {
    instance SG1:Ref.SignalGen {
        base_id = 181
        base_id_window = 20
    }
    instance SG2:Ref.SignalGen {
        base_id = 221
        base_id_window = 20
    }
    instance SG3:Ref.SignalGen {
        base_id = 201
        base_id_window = 20
    }
    instance SG4:Ref.SignalGen {
        base_id = 321
        base_id_window = 20
    }
    instance SG5:Ref.SignalGen {
        base_id = 281
        base_id_window = 20
    }
    instance textLogger:Svc.PassiveTextLogger {
        base_id = 521
        base_id_window = 20
    }  
    instance eventLogger:Svc.ActiveLogger {
        base_id = 421
        base_id_window = 20
    }
    instance chanTlm:Svc.TlmChan {
        base_id = 61
        base_id_window = 20
    }
    instance linuxTime:Svc.Time {
        base_id = 441
        base_id_window = 20
    }
    instance cmdDisp:Svc.CommandDispatcher {
        base_id = 121
        base_id_window = 20
    }
    topology REFLogger {
        SG1.logTextOut -> textLogger.TextLogger
        SG2.logTextOut -> textLogger.TextLogger
        SG3.logTextOut -> textLogger.TextLogger
        SG4.logTextOut -> textLogger.TextLogger
        SG5.logTextOut -> textLogger.TextLogger
        SG1.logOut -> eventLogger.LogRecv
        SG2.logOut -> eventLogger.LogRecv
        SG3.logOut -> eventLogger.LogRecv
        SG4.logOut -> eventLogger.LogRecv
        SG5.logOut -> eventLogger.LogRecv
        eventLogger.LogText -> textLogger.TextLogger
    }
    topology REFTelemetry {
        SG1.tlmOut -> chanTlm.TlmRecv
        SG2.tlmOut -> chanTlm.TlmRecv
        SG3.tlmOut -> chanTlm.TlmRecv
        SG4.tlmOut -> chanTlm.TlmRecv
        SG5.tlmOut -> chanTlm.TlmRecv
    }
    topology REFTime {
        SG1.timeCaller -> linuxTime.timeGetPort
        SG2.timeCaller -> linuxTime.timeGetPort
        SG3.timeCaller -> linuxTime.timeGetPort
        SG4.timeCaller -> linuxTime.timeGetPort
        SG5.timeCaller -> linuxTime.timeGetPort
    }
    topology REFCommanding {
        SG1.cmdRegOut -> cmdDisp.compCmdReg
        SG2.cmdRegOut -> cmdDisp.compCmdReg
        SG3.cmdRegOut -> cmdDisp.compCmdReg
        SG4.cmdRegOut -> cmdDisp.compCmdReg
        SG5.cmdRegOut -> cmdDisp.compCmdReg
         
        SG1.cmdResponseOut -> cmdDisp.compCmdStat
        SG2.cmdResponseOut -> cmdDisp.compCmdStat
        SG3.cmdResponseOut -> cmdDisp.compCmdStat
        SG4.cmdResponseOut -> cmdDisp.compCmdStat
        SG5.cmdResponseOut -> cmdDisp.compCmdStat
 
        cmdDisp.compCmdSend -> SG1.cmdIn
        cmdDisp.compCmdSend -> SG2.cmdIn
        cmdDisp.compCmdSend -> SG3.cmdIn
        cmdDisp.compCmdSend -> SG4.cmdIn
        cmdDisp.compCmdSend -> SG5.cmdIn
    }
}