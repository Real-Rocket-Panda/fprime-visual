namespace Simple

datatype T1
datatype T2

porttype P1 {
    arg a : T1
}

porttype P2 {
    arg a : T1
    arg b : T2
}

component OutComp {
    kind = active
    port pout : P1 {
        direction = out
    }
    port pin : P1 {
        direction = in
        kind = async
    }
}

component InComp {
    kind = passive
    port pin : P1 {
        direction = in
        kind = sync
    }
}

system sys {
    instance c1 : OutComp {
        base_id = 1
        base_id_window = 10
    }

    instance c2 : OutComp {
        base_id = 2
        base_id_window = 10
    }

    instance c3 : InComp {
        base_id = 3
        base_id_window = 10
    }

    instance c4 : InComp {
        base_id = 4
        base_id_window = 10
    }

    topology top1 {
        c1.pout -> c2.pout
    }

}