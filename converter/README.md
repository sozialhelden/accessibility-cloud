# Converter
A converter is written as a node-module and has to return an inherited instance of a Converter class from converter.js.
See csv or json on how to implement your own converter.

All converters support command-line execution through run.js in the form "node run.js <source-name>".

# CSV converter parameters
This is the parameter section if you choose converter: "csv"
```
    delimiter (char)
        Set the field delimiter. One character only, defaults to comma.
    rowDelimiter (chars|constant)
        String used to delimit record rows or a special value; special constants are 'auto', 'unix', 'mac', 'windows', 'unicode'; defaults to 'auto' (discovered in source or 'unix' if no source is specified).
    quote (char)
        Optionnal character surrounding a field, one character only, defaults to double quotes.
    escape (char)
        Set the escape character, one character only, defaults to double quotes.
    columns (array|boolean|function) 
        List of fields as an array, a user defined callback accepting the first line and returning the column names or true if autodiscovered in the first CSV line, default to null, affect the result data set in the sense that records will be objects instead of arrays.
    comment (char)
        Treat all the characters after this one as a comment, default to '' (disabled).
    objname (string)
        Name of header-record title to name objects by.
    relax (boolean)
        Preserve quotes inside unquoted field.
    relax_column_count (boolean)
        Discard inconsistent columns count, default to false.
    skip_empty_lines (boolean)
        Dont generate empty values for empty lines.
    max_limit_on_data_read (int)
        Maximum numer of characters to be contained in the field and line buffers before an exception is raised, used to guard against a wrong delimiter or rowDelimiter, default to 128000 characters.
    trim (boolean)
        If true, ignore whitespace immediately around the delimiter, defaults to false. Does not remove whitespace in a quoted field.
    ltrim (boolean)
        If true, ignore whitespace immediately following the delimiter (i.e. left-trim all fields), defaults to false. Does not remove whitespace in a quoted field.
    rtrim (boolean)
        If true, ignore whitespace immediately preceding the delimiter (i.e. right-trim all fields), defaults to false. Does not remove whitespace in a quoted field.
    auto_parse (boolean)
        If true, the parser will attempt to convert read data types to native types.
    auto_parse_date (boolean)
        If true, the parser will attempt to convert read data types to dates. It requires the "auto_parse" option.

All options are optional.


```

# JSON converter parameters
This is the parameter section if you choose converter: "json"
```
path (array of strings): A path through your JSON structure that must lead to an array of objects that will be converted.
```

# Output


## Calling convention


