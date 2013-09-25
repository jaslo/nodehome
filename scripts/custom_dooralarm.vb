Imports System.Xml
Imports System.Text.RegularExpressions

' note reported syntax errors are 13 lines greater
' ie (line 20 reported == line 7)
    
Sub Main(ByVal parms As Object)

dim devalarm as string
dim devlast as string
dim vthis as string
dim vlast as string
dim vnext as string
dim nmin as integer
dim nret as integer

    devalarm = "z6"
    devlast = "z2"
    
    // a6 stairwell motion
    // A3 downstairs motion
    // A14 kitchen motion
var motions = ["A14", "A6", "A3"];

'
' 9/30/07 new motion detectors A3/A6
' this is either A14 on (motion) or B2 (backdoor) on
' this script runs for both events
' vlast is set here and in the driveway script and
' will be A14 (motion), B2 (door) or D16 (driveway)

  vthis = LastX10
  
    vlast = getVariable("devlast");
    
' check how long ago devlast was set, drop after a couple of minutes
'       ndelta = new Date() - hs.DeviceLastChange(vthis)
'   nmin = hs.DeviceTime(vthis)
    vnext = vthis
    
    dim gotAlarm as boolean
    gotAlarm = False
    for each stest as string In motions
    	if vthis = stest then gotAlarm = True
    next
    
    if vthis = "B2" then
        hs.WriteLog("------","Backdoor: vthis=B2 vlast=" & vlast)
    else if ((vthis <> "A14") or (vlast <> "A14")) ' if vthis <> vlast then
        hs.WriteLog("-----","Motion: vthis=" & vthis & " vlast=" & vlast)
    end if
' this is for an "alarm" trip -- A13 is on for alarm    
    if  gotAlarm and hs.DeviceString(devalarm) = "armed" then
        hs.WriteLog("debug","motion while " & hs.DeviceString(devalarm) & " sensor " & vthis & "= " & hs.DeviceStatus(vthis))
        hs.SetDeviceString(devalarm,"counting")
    ' activate the alarm sequence
    ' 1.  start playing the warning and countdown
        hs.WriteLog("Alarm","--------- Tripped -----")
'        nret = hs.RunEx("countdown.txt","countdown","")

        hs.WriteLog("debug","call countdown")

        nret = hs.RunEx("countdown.vb","countdown","")

        hs.WriteLog("debug","Return from countdown")

        hs.SetDeviceString(devlast,"")
        ' leave armed
        'hs.SetDeviceString(devalarm,"armed")
        'hs.SetDeviceStatus("H16",3)

        hs.SetDeviceString(devalarm,"off")
        hs.SetDeviceStatus("H16",2)
        
        if nret <> 0 then exit sub
        hs.WriteLog("Alarm","---------- Reset -------")
        hs.TriggerEvent("InDoor")
        vnext = ""
    elseif vlast = vthis then 
        hs.SetDeviceLastChange(vthis,now)
'       hs.WriteLog("*end","set last to:" & vnext)
        exit sub
    else
        nmin = hs.DeviceTime(vlast)
        if nmin < 2 then        
            if vthis = "A14" then
                if vlast = "B2" then
                    hs.WriteLog("--------","------ IN DOOR ------")
                    hs.TriggerEvent("InDoor")
                    vnext = ""
                end if
            elseif vthis = "B2" then
                if vlast = "A14" then
                    hs.TriggerEvent("OutDoor")
                    vnext = ""
                else ' driveway, then door
                    vnext = vthis
                end if
            elseif not gotalarm then 'vthis is unknown
                hs.WriteLog("??????","unexpected vthis:" & vthis)
            end if
        else
            ' vlast is ""
            'hs.WriteLog("??????","backdoor, vlast >= 2 min:" & vlast)
            vnext = vthis
        end if
    end if

'   hs.WriteLog("*end","set last to:" & vnext)
    hs.SetDeviceString(devlast,vnext)
    ' let the door switch trigger again which should remove this from the queue
    ' sets z2 (devlast) to ""
    ' otherwise devlast could stay set forever!
'   if vnext <> "" then
'       hs.DelayTrigger(30, "clrlastdoor")
'   end if
end sub




