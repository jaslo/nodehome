sub Main(ByVal param as Object)
dim devlast as string
dim vlast as string
dim vthis as string
dim nmin as integer

    if hs.DeviceString("z6") <> "armed" then
        hs.MediaPlay("c:\wavs\ding.wav")
'         hs.MediaPlay("c:\wavs\c_bang.wav")
        hs.Speak("driveway")
    end if
    hs.WriteLog("debug","running driveway")
    hs.RemoveDelayedEvent("","clrdriveway")
    devlast = "z2"
    vlast = hs.DeviceString(devlast)
' this is either D16 on (IR) or E3 (motion) or E5 (motion) on
    vthis = hs.LastX10
    vthis = hs.StringItem(vthis,2,";")
    if vthis = "D16" then
        hs.WriteLog("****","***** DRIVEWAY *****")
    end if
    nmin = hs.DeviceTime(vthis)
'   hs.WriteLog("Info","Time elapsed:" & nmin)
    if vlast = "" then
        vlast = vthis
    else
        if vthis <> vlast then
            if vthis = "A6" and vlast = "D16" then
                hs.TriggerEvent("InDriveway")
                vlast = ""
            elseif vlast = "A6" and vthis = "D16" then
                hs.TriggerEvent("OutDriveway")
                vlast = ""
            end if
        end if
    end if
    hs.SetDeviceString(devlast,vlast)
        if hs.DeviceString("Z6") = "arming" then
           hs.RunEx("armalarm.vb","armnow","")
        end if
    ' let the door switch trigger again
    hs.DelayTrigger(12, "clrdriveway")
end sub

