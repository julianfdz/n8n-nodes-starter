import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class BuhoVectors implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Buho Suite Vectors',
		name: 'Buho Suite Vectors',
		icon: { light: 'file:../../icons/logobuhov3.svg', dark: 'file:../../icons/logobuhov3.svg' },
		group: ['transform'],
		version: 1,
		description: '',
		defaults: {
			name: 'Buho Suite Vectors',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Account ID',
				name: 'account_id',
				type: 'string',
				default: '',
				required: true,
				description: 'Identificador de la cuenta asociada al RAG',
			},
			{
				displayName: 'Knowledge Base ID (KB ID)',
				name: 'kb_id',
				type: 'string',
				default: '',
				required: true,
				description: 'Identificador de la base de conocimiento',
			},
			{
				displayName: 'Query Text',
				name: 'query_text',
				type: 'string',
				default: '',
				placeholder: 'Texto a buscar en el RAG',
				description:
					'Texto o pregunta que se desea buscar dentro de la base de conocimiento',
			},
			{
				displayName: 'Top K',
				name: 'top_k',
				type: 'number',
				default: 5,
				description:
					'Número de chunks o fragmentos más relevantes que se deben recuperar',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const account_id = this.getNodeParameter('account_id', i) as string;
				const kb_id = this.getNodeParameter('kb_id', i) as string;
				const query_text = this.getNodeParameter('query_text', i) as string;
				const top_k = this.getNodeParameter('top_k', i) as number;

				const options: IHttpRequestOptions = {
					method: 'POST' as IHttpRequestMethods,
					url: 'https://api.buhosuite.com/api/v2/kbvectors/ep_search_similar_chunks_contents_by_text/',
					body: {
						account_id,
						kb_id,
						query_text,
						top_k,
					},
					json: true,
				};

				const response = await this.helpers.httpRequest(options);
				returnData.push({ json: response });
			} catch (error: unknown) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
					});
					continue;
				}

				// Forzar tipado correcto del error para NodeOperationError
				const err = error instanceof Error ? error : new Error(String(error));
				throw new NodeOperationError(this.getNode(), err);
			}
		}

		return [returnData];
	}
}
