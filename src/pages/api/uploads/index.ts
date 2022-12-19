import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import multer from 'multer';
import fs from 'fs';
import { ApiResponse } from '../../../models/ApiResponse';
import XLSX from 'xlsx'
interface NextConnectApiRequest extends NextApiRequest {
  files: Express.Multer.File[];
}
interface Ticket {
  'Valor líquido': Number,
  'Status do recebível': String,
  'Número de parcelas' : Number
}
type ResponseData = ApiResponse<string[], string>;

const oneMegabyteInBytes = 1000000;
const outputFolderName = './public/uploads';

const upload = multer({
  limits: { fileSize: oneMegabyteInBytes * 2 },
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
  /*fileFilter: (req, file, cb) => {
    const acceptFile: boolean = ['image/jpeg', 'image/png'].includes(file.mimetype);

    cb(null, acceptFile);
  },*/
});

const apiRoute = nextConnect({
  onError(error, req: NextConnectApiRequest, res: NextApiResponse<ResponseData>) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req: NextConnectApiRequest, res: NextApiResponse<ResponseData>) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.array('theFiles'));

apiRoute.post((req: NextConnectApiRequest, res: NextApiResponse<ResponseData>) => {
  const filenames = fs.readdirSync(outputFolderName);
  const images = filenames.map((name) => name);
  var workbook = XLSX.readFile(outputFolderName+'/'+images[0]);
  console.log(workbook)
  var sheet_name_list = workbook.SheetNames;
  const dataset = <Ticket[]>XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
  
  
  function sanitizePrice(price : {'Valor líquido' : Number}){
    return Number(price['Valor líquido'].toString().replace('.', '').replace(',','.'))
  }
  const totalSold = dataset.map(ticket => sanitizePrice(ticket))
  .reduce(function(soma, i) {
    return soma + i;
  });
  
  const avista = dataset.filter(ticket=> ticket['Status do recebível'] === "Pago" ? true : false).map(ticket => sanitizePrice(ticket))
  .reduce(function(soma, i) {
    return soma + i;
  });
  
  const parcelasPagas = dataset
    .filter(ticket=> ticket['Status do recebível'] !== "Pago" ? true : false)
    .map(ticket => sanitizePrice(ticket)/(Number(ticket['Número de parcelas'])||1))
    .reduce(function(soma, i) {
      return soma + i;
    });
  
  const aReceber = dataset
    .filter(ticket=> ticket['Status do recebível'] !== "Pago" ? true : false)
    .map(ticket => sanitizePrice(ticket) - (sanitizePrice(ticket))/(Number(ticket['Número de parcelas'])||1))
    .reduce(function(soma, i) {
      return soma + i;
    });
  
  const aReceberPorMes = [1, 2].map(i => dataset
    .filter(ticket=> Number(ticket['Número de parcelas']) > i ? true : false)
    .map(ticket => sanitizePrice(ticket)/(Number(ticket['Número de parcelas'])))
    .reduce(function(soma, i) {
      return soma + i;
    }).toFixed(2)
  );

  res.status(200).json({ data: [  `Total vendido: ${totalSold.toFixed(2)}`,
  `Total a vista: ${avista.toFixed(2)}`,
  `Parcelas pagas: ${parcelasPagas.toFixed(2)}`,
  `Recebido no mês: ${(avista + parcelasPagas).toFixed(2)}`,
  `A Receber: ${aReceber.toFixed(2)}`,
  `Próximos pagamentos: ${aReceberPorMes[0]}, ${aReceberPorMes[1]}`] });
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
export default apiRoute;
