jQuery.validator.addMethod("alnum",function(value,element) {
    return this.optional(element) || /^[a-zA-Z0-9]+$/.test(value);
},"只能包含字母或数字");
