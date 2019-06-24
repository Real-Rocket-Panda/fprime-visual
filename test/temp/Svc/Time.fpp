namespace Svc

component Time {
    port timeGetPort:Fw.Time {
        direction = in
        kind = sync
        max_number = 10
        min_number = 1
    }
}