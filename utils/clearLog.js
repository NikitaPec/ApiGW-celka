import fs from "fs";
import { resolve } from "path";

export default function clearLogs() {
  const nowDate = Date.now();
  const pathLogDir = resolve(process.cwd(), "logs");
  const logsNameArray = fs.readdirSync(pathLogDir);
  logsNameArray.forEach((logNameFile) => {
    const logNameFileArray = logNameFile.split(".");
    logNameFileArray.pop();
    logNameFileArray.reverse().join("-");
    const logDate = Date.parse(logNameFileArray);
    const pathLogFile = resolve(process.cwd(), "logs", logNameFile);
    nowDate - logDate > 2500000000 ? fs.unlinkSync(pathLogFile) : true;
  });
}
