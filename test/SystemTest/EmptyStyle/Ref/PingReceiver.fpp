namespace Ref
 
component PingReceiver {
    kind = active
    port PingIn:Svc.Ping {
        direction = in
        kind = async
        number = 1     
    }
    port PingOut:Svc.Ping {
        direction = out
        number = 1
    }
}