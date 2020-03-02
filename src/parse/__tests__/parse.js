import parse from '../parse';

describe('parser', () => {
  it('can parse text', async () => {
    const text = 'a ab abcd dbca ab Ab AAB';
    const result = await parse(text);

    expect(result).toEqual({
      tokens: {
        ab: 3,
        abcd: 1,
        dbca: 1,
        aab: 1,
      },
    });
  });

  it('can parse text with custom minimal word length', async () => {
    const text = 'a ab abcd dbca ab Ab AAB';
    const params = {
      minimalLength: 4,
    };
    const result = await parse(text, params);

    expect(result).toEqual({
      tokens: {
        abcd: 1,
        dbca: 1,
      },
    });
  });

  it('can parse text with ignore word list', async () => {
    const text = 'a ab abcd dbca ab Ab AAB';
    const params = {
      ignoreWords: ['ab', 'abcd'],
    };
    const result = await parse(text, params);

    expect(result).toEqual({
      tokens: {
        dbca: 1,
        aab: 1,
      },
    });
  });

  it('can parse text with ignore word list with regexes', async () => {
    const text = 'a ab abcd dbca ab Ab AAB daba';
    const params = {
      ignoreWords: [/^a.+$/, 'daba'],
    };
    const result = await parse(text, params);

    expect(result).toEqual({
      tokens: {
        dbca: 1,
      },
    });
  });

  it('can parse text with starting position', async () => {
    const text = 'a ab abcd dbca ab Ab AAB';
    const params = {
      startPosition: 9,
    };
    const result = await parse(text, params);

    expect(result).toEqual({
      tokens: {
        dbca: 1,
        ab: 2,
        aab: 1,
      },
    });
  });

  it('can parse text with all params', async () => {
    const text = 'aba daba dOO oo duba';
    const params = {
      minimalLength: 3,
      ignoreWords: ['doo'],
      startPosition: 8,
    };
    const result = await parse(text, params);

    expect(result).toEqual({
      tokens: {
        duba: 1,
      },
    });
  });

  it('can parse text with custom delimiters', async () => {
    const text = '_BB_bcd_____QWErty';
    const params = {
      delimiters: ['_'],
    };
    const result = await parse(text, params);

    expect(result).toEqual({
      tokens: {
        bb: 1,
        bcd: 1,
        qwerty: 1,
      },
    });
  });

  it('can parse text with custom submodule', async () => {
    const customModule = jest.fn((counter) => (counter ? counter + 1 : 1));
    const text = 'word and another word';
    const params = {
      modules: {
        custom: customModule,
      },
    };
    const result = await parse(text, params);

    expect(result).toEqual({
      tokens: {
        word: 2,
        and: 1,
        another: 1,
      },
      custom: 4,
    });
    expect(customModule).toHaveBeenCalledTimes(4);
    expect(customModule).toHaveBeenCalledWith(null, 'word', 0);
    expect(customModule).toHaveBeenCalledWith(1, 'and', 5);
    expect(customModule).toHaveBeenCalledWith(2, 'another', 9);
    expect(customModule).toHaveBeenCalledWith(3, 'word', 17);
  });

  it('can skip HTML tags', async () => {
    const text = '<table><tr><td> abc </td><td> dba </td></tr><tr><td> aBC</td></tr></table>';
    const result = await parse(text);

    expect(result).toEqual({
      tokens: {
        abc: 2,
        dba: 1,
      },
    });
  });
});
