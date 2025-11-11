////onSubmit(): void {
//  //if (this.cadastroForm.valid) {
//    //this.loading = true;
//    this.mensagemErro = '';
//
////    const dadosCadastro = {
//  //    nome: this.cadastroForm.get('nome')?.value,
//    //  email: this.cadastroForm.get('email')?.value,
//      ///senha: this.cadastroForm.get('senha')?.value
//    };
//
//    // ✅ AGORA VAI FUNCIONAR!
//    this.authService.criarUsuario(dadosCadastro).subscribe({
//      next: (response) => {
//        this.loading = false;
//        console.log('Cadastro realizado com sucesso!', response);
//        this.router.navigate(['/login']);
//      },
//      error: (error: { error: { mensagem: string; }; }) => {
//        this.loading = false;
//        console.error('Erro no cadastro:', error);
//        this.mensagemErro = error.error?.mensagem || 'Erro ao realizar cadastro.';
//      }
//    });
//  }
//}