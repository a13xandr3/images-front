import { JsonReaderPipe } from './json-reader.pipe';

describe('JsonReaderPipe', () => {
  const pipe = new JsonReaderPipe();

  it('should format a value as JSON', () => {
    expect(pipe.transform({ name: 'imagem.jpg', size: 1024 })).toBe(
      '{\n  "name": "imagem.jpg",\n  "size": 1024\n}',
    );
  });

  it('should return an empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return an empty string for circular structures', () => {
    const value: Record<string, unknown> = {};
    value['self'] = value;

    expect(pipe.transform(value)).toBe('');
  });
});
