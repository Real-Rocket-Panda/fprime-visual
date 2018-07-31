namespace Large

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

    instance c1 : InComp {
        base_id = 1
        base_id_window = 10
    }

    instance c2 : InComp {
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

    instance c5 : InComp {
        base_id = 5
        base_id_window = 10
    }

    instance c6 : InComp {
        base_id = 6
        base_id_window = 10
    }

    instance c7 : InComp {
        base_id = 7
        base_id_window = 10
    }

    instance c8 : InComp {
        base_id = 8
        base_id_window = 10
    }

    instance c9 : InComp {
        base_id = 9
        base_id_window = 10
    }

    instance c10 : InComp {
        base_id = 10
        base_id_window = 10
    }

    instance c11 : OutComp {
        base_id = 11
        base_id_window = 10
    }

    instance c12 : OutComp {
        base_id = 12
        base_id_window = 10
    }

    instance c13 : OutComp {
        base_id = 13
        base_id_window = 10
    }

    instance c14 : OutComp {
        base_id = 14
        base_id_window = 10
    }

    instance c15 : OutComp {
        base_id = 15
        base_id_window = 10
    }

    instance c16 : OutComp {
        base_id = 16
        base_id_window = 10
    }

    instance c17 : OutComp {
        base_id = 17
        base_id_window = 10
    }

    instance c18 : OutComp {
        base_id = 18
        base_id_window = 10
    }

    instance c19 : OutComp {
        base_id = 19
        base_id_window = 10
    }

    instance c20 : OutComp {
        base_id = 20
        base_id_window = 10
    }

    topology top1 {
        c11.pout -> c1.pin
        c12.pout -> c2.pin
        c13.pout -> c3.pin
        c14.pout -> c4.pin
        c15.pout -> c5.pin
        c11.pout -> c6.pin
        c16.pout -> c7.pin
        c17.pout -> c8.pin
        c18.pout -> c9.pin
        c19.pout -> c10.pin

        c11.pout -> c12.pin
        c12.pout -> c13.pin
        c13.pout -> c14.pin
        c14.pout -> c15.pin
        c15.pout -> c16.pin
        c16.pout -> c17.pin
        c17.pout -> c18.pin
        c18.pout -> c19.pin
        c19.pout -> c20.pin
        c20.pout -> c11.pin
    }

}
