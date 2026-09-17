# Suno Cover Matcher

En lille Windows-app til at parre M4A-sange med PNG-covers, visuelt og manuelt.

## Det den gør

1. Vælg en mappe med dine `.m4a`-sange.
2. Vælg en mappe med dine `.png`-covers.
3. Træk et cover til en sangrække, eller vælg et cover og klik på sangrækken.
4. Vælg en tom outputmappe og klik **Skriv covers**.

Appen kopierer lydstrømmen uden genkodning og indlejrer det valgte PNG-cover. Originalerne bliver ikke ændret. Den færdige fil får samme filnavn som den oprindelige M4A-fil, så parringen efterfølgende er entydig. En fil, der allerede findes i outputmappen, overskrives aldrig; den markeres som fejl i revisionslisten.

Efter hver vellykket eksport omdøber appen det oprindelige anvendte PNG-cover i covermappen til sangens navn, fx `14.png` til `True True Love.png`. Der oprettes ingen PNG-kopier. Hvis `True True Love.png` allerede findes, fortsætter appen: den eksisterende fil omdøbes først til `True True Love.png.old`, og den valgte PNG får derefter sangens navn. Findes `True True Love.png.old` allerede, afbrydes hele eksporten før nogen ny fil skrives—det er tegn på en fejltilstand, der skal undersøges.

En `cover-matches.json` gemmes i outputmappen som revisionsspor over alle valg.

## Byg til Windows 10

Installer Node.js LTS på Windows, åbn mappen i PowerShell og kør:

```powershell
npm install
npm run package:win
```

Installationsfilen kommer i `dist/`. Bygningen inkluderer FFmpeg, så slutbrugeren behøver ikke installere noget ekstra.

## Daglig brug

Tryk på **Ryd tildelinger** hvis du vil starte en omparring. Et cover kan kun tildeles én sang ad gangen; tildeler du det igen, flyttes det automatisk. Kun tildelte sange eksporteres.
