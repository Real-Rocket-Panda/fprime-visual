namespace Svc
 
porttype Ping {
    arg key:U32
}
 
porttype FatalEvent {
    arg id:FwEventIdType
}
 
porttype Sched {
    arg context:NATIVE_UINT_TYPE
}