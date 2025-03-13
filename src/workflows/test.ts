import {
  createWorkflow,
  WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';

export const testWorkflow = createWorkflow('test-workflow', () => {
  console.log('Test workflow executed!');
  return new WorkflowResponse('success');
});
