namespace Svc
 
component TlmChan{
    kind = active
    port TlmRecv:Fw.Tlm {
        kind = guarded
        direction = in
        number = 1..10
    }
    port TlmGet:Fw.Tlm {
        kind = guarded
        direction = in
    }
    port Run:Svc.Sched {
        kind = async
        direction = in
    }
}
