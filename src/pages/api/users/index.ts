import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import XLSX from 'xlsx'
interface IResponseData {
  users: unknown[];
}

/**
 * ts-prune-ignore-next
 */
export default (req: NextApiRequest, res: NextApiResponse<IResponseData>): void => {
  const sampleUserData = [
    { id: '101', name: 'Alice' },
    { id: '102', name: 'Bob' },
    { id: '103', name: 'Caroline' },
    { id: '104', name: 'Dave' },
  ];
  const outputFolderName = './public/uploads';

  const filenames = fs.readdirSync(outputFolderName);
  const images = filenames.map((name) => name);
  var workbook = XLSX.readFile(outputFolderName+'/'+images[0]);
  console.log(workbook)
  res.status(200).json({ users: sampleUserData });
};
