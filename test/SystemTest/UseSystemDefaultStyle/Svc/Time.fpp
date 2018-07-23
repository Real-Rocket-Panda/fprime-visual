namespace Svc

component Time{
    kind = passive
    port timeGetPort:Fw.Time {
        kind = sync
        direction = in
        number = 1..10
    }
}
