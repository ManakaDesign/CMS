# **Builder**


**Fehler:**
---



1\. Wenn ich eine row mit 2 columns anlege und versuche ein Element (.z.B. Text) in die rechte column zu ziehen zeigt er mr zwar den Ablageindikator in der rechten column an, aber wenn ich loslasse taucht der Text in der linken column auf

2. Wenn ich eine row mit 2 columns habe und der ersten column z.B. einen padding von 40px gebe wird er angewandt. Wenn ich dann ein anderes Element anklick, z.B. eine Section und danach wieder die row in der die column mit 40px adding ist dann löscht er in der Ansicht das rechte padding, alle anderen Paddings werden richtig dargestellt. Wenn ich dann die Seite neu lade stimmt es wieder so lange bis ich die Row wieder anklicke, auswähle.



3\. Wenn ich eine row mit 2 columns anlege und in beiden Inhalt habe, dann von Desktop auf Mobile-Ansicht wechsle, dann schiebt er die Inhalt von der zweiten column in die erste column und zeigt die zweite gar nicht dan. Außerdem schiebt er den Inhalt zum Teil über den Inhalt der ersten column. Besser wäre es wenn er die Columns bei zwei belässt aber in Mobile untereinander anordnet.

4. Wenn ich ein paar Buttons auswähle und ihnen die Eigenschaft Display block gebe und sie dann mittig aligne, funktioniert alles wie es soll. Wenn ich diesen Button aber dann einen Bottom margin gebe springen sie automatisch nach links aber der alignment button steht immer noch auf cente. Wenn ich dann  auf alignment links klicke und danach wieder auf Center, dann springen sie ganz nach rechts. Und wenn ich dann auf alignment rechts klicke und danach wieder auf ein anderes, dann funktioniert es wieder wie es soll, dann kann ich auch wieder zuverlässig das Alignment ändern



###### **Verbesserungen:**


1. In den Column Setting sollten auch eine Klasse und eine ID definierbar sein


2. Das Modal für die responsive Breakpoints ist jetzt gerade mittig, aber kann oben beim entsprechenden Button angeordnet sein




**Seitenübersicht**
===





###### **Verbesserungen:**



1\. Wenn ich eine Seite neu anlege, ist dort beim Modal noch der Hintergrund schwarz, sollte wie beim Modal für Responsive Settings transparent bzw. kein Hintergrund sein







# **Allgemein**





###### **Fehler:**



1\. Wenn ich auf https://cms.manaka-design.de/public/admin/dashboard bin und neu lade kommt : dashboard:1  GET https://cms.manaka-design.de/public/admin/dashboard 404 (Not Found)

Wenn ich dann Dashboard aus der URL lösche, also https://cms.manaka-design.de/public/admin/ eingebe, leitet er mich weiter auf https://cms.manaka-design.de/public/admin/dashboard und die Seite erscheint ohne irgendwelche Consolenwarnungen






