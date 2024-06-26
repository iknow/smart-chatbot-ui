import cl100k from 'tiktoken/encoders/cl100k_base.json';
import p50k from 'tiktoken/encoders/p50k_base.json';
import { Tiktoken } from 'tiktoken/lite';
import { encoding_for_model } from 'tiktoken';

export const getTiktokenEncoding = async (model: string): Promise<Tiktoken> => {
  // Azure fix
  const modelId = model.replace('gpt-35', 'gpt-3.5')
  if (modelId.indexOf('text-davinci-') !== -1) {
    return new Tiktoken(p50k.bpe_ranks, p50k.special_tokens, p50k.pat_str);
  }
  if (modelId.indexOf('gpt-4o') !== -1) {
    return encoding_for_model('gpt-4o');
  }
  if (modelId.indexOf('gpt-3.5') !== -1) {
    return encoding_for_model('gpt-3.5-turbo', {
      '<|im_start|>': 100264,
      '<|im_end|>': 100265,
      '<|im_sep|>': 100266,
    });
  }
  if (modelId.indexOf('gpt-4') !== -1) {
    return encoding_for_model('gpt-4', {
      '<|im_start|>': 100264,
      '<|im_end|>': 100265,
      '<|im_sep|>': 100266,
    });
  }
  return new Tiktoken(cl100k.bpe_ranks, cl100k.special_tokens, cl100k.pat_str);
};
