namespace Svc

component TlmChan {
    port TlmRecv:Fw.Tlm {
        direction = in
        kind = guarded
        max_number = 10
        min_number = 1
    }
    port TlmGet:Fw.Tlm {
        direction = in
        kind = guarded
    }
    port Run:Svc.Sched {
        direction = in
        kind = async
    }
}