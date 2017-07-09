/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview A base class for string enums, all string enums in TS files should extends this
 * class. The reason why we should use this class as opposed to doing `type MyEnum = 'foo' | 'bar'`
 * is because this class gives us a type for type-checking AND ability to see and pass possible
 * values using MyEnum.FOO. You can also do MyEnum.FOO.toString() to convert it to string if needed.
 *
 * See http://stackoverflow.com/questions/15490560/create-an-enum-with-string-values-in-typescript
 * for more info.
 *
 * A sample child class:
 *
 * class MyEnum extends StringEnumBase {
 *   static FOO = new MyEnum('foo');
 *   static BAR = new MyEnum('bar');
 * }
 *
 * Now you can use it as argument type:
 * `function myFunc(MyEnum enum) {...}`
 *
 * And pass values like `myFunc(MyEnum.FOO)`
 *
 */
export default class StringEnumBase {

    constructor(public value:string) {
    }

    toString() {
        return this.value;
    }
}
